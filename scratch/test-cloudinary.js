const url = 'https://res.cloudinary.com/dpaq3ova2/image/upload/v1777040685/steav_news/file_wdwvkn.webp';
const title = 'ស្ងាត់ៗ! នារីម្នាក់ពោលថា “នារីទំនើងម្នាក់នេះនឹកបង” ហើយក៏សម្រេចចិត្ត Post Status';

const safeTitle = encodeURIComponent(title)
  .replace(/%2C/g, '%252C')
  .replace(/%2F/g, '%252F');

const baseScale = 'c_fill,w_1200,h_630';
const titleTransform = `/l_text:Battambang_50_bold_center:${safeTitle},c_fit,w_1100,co_rgb:e60000,bo_4px_solid_white,g_south,y_60/fl_layer_apply`;
const watermarkTransform = '/l_steav_news_watermark,w_1.0,h_1.0,c_scale,fl_relative/fl_layer_apply';
const finalScale = '/c_fill,w_800,h_450';
const formatTransform = '/q_auto,f_auto';

const finalUrl = url.replace('/upload/', `/upload/${baseScale}${titleTransform}${watermarkTransform}${finalScale}${formatTransform}/`);

console.log('Final URL:', finalUrl);

// Let's try to fetch it
const https = require('https');
https.get(finalUrl, (res) => {
  console.log('Status Code:', res.statusCode);
  if (res.statusCode !== 200) {
    console.log('Headers:', res.headers);
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log('Body:', data));
  }
});
