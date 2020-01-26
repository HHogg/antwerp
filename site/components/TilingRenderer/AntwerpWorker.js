import antwerp from 'antwerp';

onmessage = (({ data }) => {
  try {
    postMessage(antwerp(data));
  } catch (e) {
    postMessage({ error: e });
  }
});
