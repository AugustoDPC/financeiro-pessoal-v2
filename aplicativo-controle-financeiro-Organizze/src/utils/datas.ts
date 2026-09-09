export const obterMesAno = (data: Date = new Date()): string => data.toISOString().substring(0, 7);

export const dataEhPassadaOuAtual = (dataIso: string, referencia: Date = new Date()): boolean => {
  return new Date(dataIso) <= referencia;
};

export const dataParaIsoDia = (data: Date): string => data.toISOString().split('T')[0];
