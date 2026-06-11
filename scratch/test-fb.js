fetch('https://www.facebook.com/share/v/1E2P111Nta/', {
  headers: {
    'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'
  }
})
.then(r => console.log('Resolved URL:', r.url))
.catch(err => console.error(err));
