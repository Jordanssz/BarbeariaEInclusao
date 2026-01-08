package br.cefetmg.barbeariainclusao.model;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class Atendimento {
    private Long idAtendimento;
    private long idUsuarioAtendimento;
    private long idBarbeiroAtendimento;
    private long idServicoAtendimento;
    private String dataAtendimento;
    private String horaAtendimento;
    private String statusAtendimento; //isso para aparecer como realizado ou coisa assim
}
    