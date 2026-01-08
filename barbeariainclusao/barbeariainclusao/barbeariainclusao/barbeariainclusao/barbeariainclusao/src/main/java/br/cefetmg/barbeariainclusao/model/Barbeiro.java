package br.cefetmg.barbeariainclusao.model;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Barbeiro {

    private Long idBarbeiro;
    private String nomeBarbeiro;
    private String descricaoBarbeiro;
    private String emailBarbeiro;
    private String telefoneBarbeiro;
    private String fotoBarbeiro;
    private String senhaBarbeiro;

    // <-- Alterado de 'long' (primitivo) para 'Long' (wrapper) para permitir null e
    // casar corretamente com JDBI bindings e validações no controller.
    private Long idBarbeariaBarbeiro;
}
