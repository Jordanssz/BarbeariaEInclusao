package br.cefetmg.barbeariainclusao.model;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class Caracteristica {
    private Long idCaracteristica;
    private String nomeCaracteristica;
    private String descricaoCaracteristica;
}
