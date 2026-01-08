package br.cefetmg.barbeariainclusao.model;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Barbearia {

    private Long idBarbearia;
    private String nomeBarbearia;
    private String enderecoBarbearia;
    private String descricaoBarbearia;
    private String senhaBarbearia;
    private String emailBarbearia;
    private Double latitude;
    private Double longitude;

    // Alterado de String para byte[] para suportar upload de foto
    private byte[] fotoBarbearia;
}
