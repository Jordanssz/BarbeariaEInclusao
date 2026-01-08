package br.cefetmg.barbeariainclusao.model;


import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor


public class BarbeiroTag {
    private Long idBarbeiro;
    private Long idTag;
    private Boolean possui;
}
