package br.cefetmg.barbeariainclusao.model;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class Usuario {
    
    private Long idUsuario;
    private String nomeUsuario;
    private String telefoneUsuario;
    private String senhaUsuario;
    private String emailUsuario;
    private String fotoUsuario;
}
