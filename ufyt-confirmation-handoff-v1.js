(function(){
 'use strict';
 window.ufytConfirmationDestination=function(result,fallback){
  if(!result||result.duplicate===true||result.route==='resolution'||!result.confirmation_url)return fallback;
  try{
   var url=new URL(result.confirmation_url);
   return url.origin==='https://payments.ufyt.dev'&&!url.username&&!url.password&&/^\/confirmation\/[a-f0-9]{64}$/.test(url.pathname)&&!url.search&&!url.hash?url.toString():fallback;
  }catch{return fallback;}
 };
})();
