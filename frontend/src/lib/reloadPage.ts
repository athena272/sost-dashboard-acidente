/** Recarrega a página inteira; isolado para poder ser substituído nos testes. */
export function reloadPage(): void {
  window.location.reload();
}
