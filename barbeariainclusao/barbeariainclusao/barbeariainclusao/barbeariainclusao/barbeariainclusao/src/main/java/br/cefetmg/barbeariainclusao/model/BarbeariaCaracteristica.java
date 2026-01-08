package br.cefetmg.barbeariainclusao.model;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
/**
 * Representa o vínculo entre Barbearia e Caracteristica.
 * Inclui o campo 'nomeCaracteristica' para mapeamento de resultados de JOINs SQL no JDBI.
 */
public class BarbeariaCaracteristica {
    
    private Long idBarbearia;
    private Long idCaracteristica;
    private Boolean possui;

    // 🌟 CAMPO ADICIONADO: O JDBI precisa deste campo para mapear o resultado do JOIN 
    // com o alias 'nomeCaracteristica' definido no Repository.
    private String nomeCaracteristica;
    private String descricaoCaracteristica;
}
