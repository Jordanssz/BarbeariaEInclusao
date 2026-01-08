package br.cefetmg.barbeariainclusao.model;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class Tag {
    private Long idTag;
    private String nomeTag;
    private String descricaoTag;
}
