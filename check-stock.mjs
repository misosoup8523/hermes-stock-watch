const PRODUCT_URL =
  'https://www.hermes.com/jp/ja/product/%E3%83%96%E3%83%AC%E3%82%B9%E3%83%AC%E3%83%83%E3%83%88-%E3%80%8A%E3%83%95%E3%82%A1%E3%83%A9%E3%83%B3%E3%83%89%E3%83%BC%E3%83%AB%E3%80%8B-H104567Bv00ST/';

const response = await fetch(PRODUCT_URL, {
  headers: {
    'user-agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
    'accept-language': 'ja-JP,ja;q=0.9,en;q=0.8',
  },
});

if (!response.ok) {
  throw new Error(`Hermès returned HTTP ${response.status}`);
}

const html = await response.text();
const text = html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');
const outOfStock = text.includes('このアイテムは現在在庫がございません');
const canAddToBag = /(?:ショッピングバッグ|バッグ|カート)に追加|今すぐ購入|購入する/.test(text);
const price = text.match(/価格\s*[￥¥]\s*([\d,]+)/)?.[1] ?? null;
const sizes = [
  ...new Set(
    [...text.matchAll(/(?:サイズ|内周)\s*[:：]?\s*([0-9][0-9., ]{0,12}(?:cm|CM)?)/g)].map((match) => match[1].trim()),
  ),
];

const status = !outOfStock && canAddToBag ? 'in_stock' : outOfStock ? 'out_of_stock' : 'unknown';
process.stdout.write(
  JSON.stringify({ status, price: price ? `￥${price}` : null, sizes, url: PRODUCT_URL }),
);
