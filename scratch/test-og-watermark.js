fetch('https://res.cloudinary.com/dpaq3ova2/image/upload/c_fill,w_1200,h_630/l_steav_news_watermark,w_1.0,h_1.0,c_scale,fl_relative/fl_layer_apply/f_auto,q_auto:best/v1773819863/steav_news/file_ujryvg.jpg')
  .then(res => {
    console.log('Status:', res.status);
    console.log('Headers:', res.headers.get('content-type'));
  })
  .catch(console.error);
