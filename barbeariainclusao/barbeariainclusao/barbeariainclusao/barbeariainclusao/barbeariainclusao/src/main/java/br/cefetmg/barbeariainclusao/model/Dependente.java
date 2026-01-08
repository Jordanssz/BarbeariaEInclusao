package br.cefetmg.barbeariainclusao.model;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class Dependente {

    private Long idDependente;
    private String nomeDependente;
    private String descricaoDependente;
    //private String parentescoDependente; (ideia se der)
    private Long idUsuario;

}
