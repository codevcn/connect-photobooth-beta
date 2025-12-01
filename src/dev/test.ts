export const insert = (printAreaContainer: HTMLElement, clear: boolean = false) => {
  console.log('>>> [add] insert:', {
    printAreaContainer,
    devPreview: document.body.querySelector<HTMLElement>('.NAME-app-temp-container'),
  })
  if (clear) {
    document.body.querySelector<HTMLElement>('.NAME-app-temp-container')!.innerHTML = ''
  }
  document.body
    .querySelector<HTMLElement>('.NAME-app-temp-container')!
    .appendChild(printAreaContainer)
}
