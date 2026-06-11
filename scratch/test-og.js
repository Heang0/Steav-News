const url = 'http://localhost:3000/a/a8c4661c';

fetch(url)
  .then(res => res.text())
  .then(html => {
    const match = html.match(/<meta property="og:image" content="(.*?)"/);
    console.log(match ? match[1] : 'No og:image found');
  })
  .catch(console.error);
