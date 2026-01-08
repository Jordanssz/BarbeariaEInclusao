package br.cefetmg.barbeariainclusao.controller;

public class CriarSolicitacaoDTO {

    private String codigoProfissional;
    private Long idBarbeariaRemetente;

    public String getCodigoProfissional() {
        return codigoProfissional;
    }

    public void setCodigoProfissional(String codigoProfissional) {
        this.codigoProfissional = codigoProfissional;
    }

    public Long getIdBarbeariaRemetente() {
        return idBarbeariaRemetente;
    }

    public void setIdBarbeariaRemetente(Long idBarbeariaRemetente) {
        this.idBarbeariaRemetente = idBarbeariaRemetente;
    }
}
