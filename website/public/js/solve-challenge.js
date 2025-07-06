importScripts('/js/js-sha512.js');

onmessage = (e) => {
  const code = e.data[0];
  let nonce = 0;

  const sha512 = self.sha512;

  while (true) {
    const hash = sha512(`${code}${nonce}`);
    if (hash.startsWith('000')) {
      postMessage({
        nonce: nonce,
      });
      break;
    }
    nonce++;
  }
};
