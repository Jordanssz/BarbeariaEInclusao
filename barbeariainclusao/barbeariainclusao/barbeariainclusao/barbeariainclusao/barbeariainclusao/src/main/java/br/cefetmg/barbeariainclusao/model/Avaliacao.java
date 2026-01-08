package br.cefetmg.barbeariainclusao.model;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class Avaliacao {

    private Long idAvaliacao;
    private int nota;
    private String comentario;
    private long idAtendimentoAvaliacao;

}
