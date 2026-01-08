export interface Agendamento {
  /**
   * ID, opcional para criação (POST), obrigatório para GET/PUT/DELETE.
   * Corresponde a 'idAtendimento' no modelo Java.
   */
  idAtendimento?: number;

  /**
   * ID do cliente/usuário.
   * Corresponde a 'idUsuarioAtendimento' no modelo Java.
   */
  idUsuarioAtendimento: number;

  /**
   * ID do barbeiro/profissional.
   * Corresponde a 'idBarbeiroAtendimento' no modelo Java.
   */
  idBarbeiroAtendimento: number;

  /**
   * ID do serviço agendado.
   * Corresponde a 'idServicoAtendimento' no modelo Java.
   */
  idServicoAtendimento: number;

  /**
   * Data do agendamento (formato 'YYYY-MM-DD').
   * Corresponde a 'dataAtendimento' no modelo Java.
   */
  dataAtendimento: string;

  /**
   * Hora do agendamento (formato 'HH:MM:SS').
   * Corresponde a 'horaAtendimento' no modelo Java.
   */
  horaAtendimento: string;

  /**
   * Status do agendamento (ex: 'AGENDADO').
   * Corresponde a 'statusAtendimento' no modelo Java.
   */
  statusAtendimento: string;
}
