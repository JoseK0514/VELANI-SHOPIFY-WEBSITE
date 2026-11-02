"""Export API-returned bodies, accepting only bytes matching the original MD5."""
import hashlib
import itertools
import json
import pathlib
import re
import zipfile

root = pathlib.Path('evidence/private')
theme = json.loads((root / 'original-theme-baseline-fresh03.json').read_text())['data']['theme']
out = root / 'original-theme-190572462394-attempt03'


def without_empty_settings(value):
    if isinstance(value, dict):
        return {key: without_empty_settings(item) for key, item in value.items()
                if not (key == 'settings' and item == {})}
    if isinstance(value, list):
        return [without_empty_settings(item) for item in value]
    return value


def formatting_variants(value, level=0):
    if isinstance(value, dict):
        if not value:
            return ['{}', '{ }']
        result = []
        for children in itertools.product(*(formatting_variants(item, level + 1) for item in value.values())):
            pairs = [json.dumps(key) + ': ' + child for key, child in zip(value, children)]
            for pad in ['', ' ']:
                result.append('{' + pad + ', '.join(pairs) + pad + '}')
            result.append('{\n' + '\n'.join('  ' * (level + 1) + pair + (',' if i < len(pairs) - 1 else '') for i, pair in enumerate(pairs)) + '\n' + '  ' * level + '}')
        return result
    if isinstance(value, list):
        return ['[' + ', '.join(json.dumps(item) for item in value) + ']', '[ ' + ', '.join(json.dumps(item) for item in value) + ' ]', '[\n' + '\n'.join('  ' * (level + 1) + json.dumps(item) + (',' if i < len(value) - 1 else '') for i, item in enumerate(value)) + '\n' + '  ' * level + ']']
    return [json.dumps(value)]


manifest = []
for file in theme['files']['nodes']:
    filename = file['filename']
    assert not pathlib.PurePosixPath(filename).is_absolute() and '..' not in pathlib.PurePosixPath(filename).parts
    dest = out / filename
    dest.parent.mkdir(parents=True, exist_ok=True)
    if file['body']['__typename'] == 'OnlineStoreThemeFileBodyText':
        source = file['body']['content']
        candidates = [source]
        if hashlib.md5(source.encode()).hexdigest() != file['checksumMd5'] and filename.endswith('.json'):
            clean = source[source.find('{'):]
            candidates.append(clean)
            value = json.loads(clean)
            for item in [value, without_empty_settings(value)]:
                for indent in [None, 0, 1, 2, 3, 4, '\t']:
                    for separators in [None, (',', ':'), (', ', ': '), (',', ': ')]:
                        pretty = json.dumps(item, indent=indent, separators=separators, ensure_ascii=False)
                        compact_arrays = re.sub(r'\[\s+((?:"[^"\n]*"(?:,\s*)?)+)\s+\]',
                                                lambda match: '[' + re.sub(r'\s+', '', match[1]) + ']', pretty)
                        for text in [pretty, compact_arrays]:
                            candidates.extend([text, text + '\n'])
        exact = next((text for text in candidates if hashlib.md5(text.encode()).hexdigest() == file['checksumMd5']), None)
        if exact is None and filename.startswith('templates/'):
            for item in [value, without_empty_settings(value)]:
                for text in formatting_variants(item):
                    for ending in ['', '\n']:
                        if hashlib.md5((text + ending).encode()).hexdigest() == file['checksumMd5']:
                            exact = text + ending
        if exact is None:
            raise RuntimeError('Cannot reconstruct original bytes: ' + filename)
        dest.write_text(exact)
    raw = dest.read_bytes()
    assert hashlib.md5(raw).hexdigest() == file['checksumMd5'], filename
    manifest.append({'filename': filename, 'bytes': len(raw), 'md5': file['checksumMd5'], 'sha256': hashlib.sha256(raw).hexdigest()})

receipt = {'themeId': theme['id'], 'name': theme['name'], 'role': theme['role'], 'updatedAt': theme['updatedAt'],
           'note': 'Shopify-generated JSON headers/formatting/empty settings removed only when bytes exactly match the API checksum. Raw API bodies preserved separately.', 'files': manifest}
(root / 'original-theme-export-manifest.json').write_text(json.dumps(receipt, indent=2) + '\n')
archive = root / 'original-theme-190572462394.zip'
with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as output:
    for file in theme['files']['nodes']:
        output.write(out / file['filename'], file['filename'])
with zipfile.ZipFile(archive) as output:
    assert output.testzip() is None
    assert len(output.namelist()) == len(manifest)
for file in out.rglob('*'):
    if file.is_file():
        file.chmod(0o444)
archive.chmod(0o444)
print(json.dumps({'files': len(manifest), 'allApiChecksumsMatch': True,
                  'zipBytes': archive.stat().st_size, 'sha256': hashlib.sha256(archive.read_bytes()).hexdigest()}))
