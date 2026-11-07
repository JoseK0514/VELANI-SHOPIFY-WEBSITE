import {expect,it} from 'vitest';
import {readClientHubConfig} from '../src/client-hub/config.js';

const environment={CLIENT_HUB_ENABLED:'true',CLIENT_HUB_DATABASE_URL:'postgresql://fixture.invalid/isolated',RESEND_API_KEY:'fixture-key',SESSION_HASH_SECRET:'fixture-only-'.repeat(4),TURNSTILE_SECRET_KEY:'fixture-secret',TURNSTILE_SITE_KEY:'public-fixture',CLIENT_HUB_ALLOWED_ORIGINS:'https://www.thevelani.com,https://x19hvn-ar.myshopify.com'};

it('can expose disabled configuration without AI or database credentials',()=>{
  expect(readClientHubConfig({})).toMatchObject({enabled:false,allowedOrigins:[]});
  expect(readClientHubConfig(environment)).toMatchObject({enabled:true,allowedOrigins:['https://www.thevelani.com','https://x19hvn-ar.myshopify.com']});
});
it('refuses activation if any required delivery or verification setting is missing',()=>{
  for(const key of Object.keys(environment)){
    if(key==='CLIENT_HUB_ENABLED')continue;
    expect(()=>readClientHubConfig({...environment,[key]:''})).toThrow('not fully configured');
  }
  expect(()=>readClientHubConfig({...environment,SESSION_HASH_SECRET:'short'})).toThrow();
  expect(()=>readClientHubConfig({...environment,CLIENT_HUB_ENABLED:'yes'})).toThrow();
});
it('rejects insecure or non-origin CORS configuration',()=>{
  for(const origin of ['http://localhost:8080','https://www.thevelani.com/path','https://user:password@www.thevelani.com','https://www.thevelani.com/#fragment']){
    expect(()=>readClientHubConfig({...environment,CLIENT_HUB_ALLOWED_ORIGINS:origin})).toThrow();
  }
});
