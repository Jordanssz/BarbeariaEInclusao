package br.cefetmg.barbeariainclusao.repository;

import br.cefetmg.barbeariainclusao.model.Solicitacao;
import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.customizer.Bind;
import org.jdbi.v3.sqlobject.customizer.BindBean;
import org.jdbi.v3.sqlobject.statement.GetGeneratedKeys;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RegisterBeanMapper(Solicitacao.class)
public interface SolicitacaoRepository {

    // =========================
    // CONSULTAS
    // =========================

    @SqlQuery("SELECT * FROM solicitacao;")
    List<Solicitacao> findAll();

    @SqlQuery("SELECT * FROM solicitacao WHERE id_solicitacao = :id;")
    Solicitacao findById(@Bind("id") Long id);

    @SqlQuery("""
        SELECT * FROM solicitacao 
        WHERE id_barbeiro_destinatario = :idBarbeiro;
    """)
    List<Solicitacao> findByBarbeiroDestinatario(@Bind("idBarbeiro") Long idBarbeiro);

    @SqlQuery("""
        SELECT * FROM solicitacao 
        WHERE id_barbearia_remetente = :idBarbearia;
    """)
    List<Solicitacao> findByBarbeariaRemetente(@Bind("idBarbearia") Long idBarbearia);

    // =========================
    // INSERT / UPDATE
    // =========================

    @SqlUpdate("""
        INSERT INTO solicitacao (
            id_barbeiro_destinatario,
            id_barbearia_remetente,
            estado_solicitacao
        ) VALUES (
            :idBarbeiroDestinatario,
            :idBarbeariaRemetente,
            :estadoSolicitacao
        );
    """)
    @GetGeneratedKeys
    Long insert(@BindBean Solicitacao solicitacao);

    @SqlUpdate("""
        UPDATE solicitacao SET
            estado_solicitacao = :estadoSolicitacao
        WHERE id_solicitacao = :idSolicitacao;
    """)
    int update(@BindBean Solicitacao solicitacao);

    // =========================
    // VÍNCULO BARBEIRO ↔ BARBEARIA
    // =========================

    @SqlUpdate("""
        INSERT INTO barbeiro_barbearia (id_barbeiro, id_barbearia)
        VALUES (:idBarbeiro, :idBarbearia);
    """)
    void criarVinculo(
        @Bind("idBarbeiro") Long idBarbeiro,
        @Bind("idBarbearia") Long idBarbearia
    );

    // =========================
    // AUXILIAR
    // =========================

    @SqlQuery("""
        SELECT id_barbeiro 
        FROM barbeiro 
        WHERE id_barbeiro = :codigo;
    """)
    Long buscarIdBarbeiroPorCodigo(@Bind("codigo") String codigo);
}
