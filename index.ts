const rootElement = document.getElementById('root');
if (rootElement) {
  const para = document.createElement('h1');
  const node = document.createTextNode('TypeScript Starter');
  para.appendChild(node);
  rootElement.appendChild(para);
}
