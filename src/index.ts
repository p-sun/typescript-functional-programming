const rootElement = document.getElementById('root');
if (rootElement) {
  const para = document.createElement('p');
  const node = document.createTextNode('Hello World');
  para.appendChild(node);
  rootElement.appendChild(para);
}
