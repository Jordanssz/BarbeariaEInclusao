package br.cefetmg.barbeariainclusao.repository;

import br.cefetmg.barbeariainclusao.model.Avaliacao;
import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.customizer.Bind;
import org.jdbi.v3.sqlobject.customizer.BindBean;
import org.jdbi.v3.sqlobject.statement.GetGeneratedKeys;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RegisterBeanMapper(Avaliacao.class)
public interface AvaliacaoRepository {

    @SqlQuery("SELECT * FROM avaliacao;")
    List<Avaliacao> findAll();

    @SqlQuery("SELECT * FROM avaliacao WHERE id_avaliacao = :id;")
    Avaliacao findById(@Bind("id") Long id);

    @SqlQuery("SELECT * FROM avaliacao WHERE id_atendimento_avaliacao = :idAtendimento;")
    List<Avaliacao> findByAtendimento(@Bind("idAtendimento") Long idAtendimento);

    @SqlUpdate("""
        INSERT INTO avaliacao (
            nota,
            comentario,
            id_atendimento_avaliacao
        )
        VALUES (
            :nota,
            :comentario,
            :idAtendimentoAvaliacao
        );
    """)
    @GetGeneratedKeys
    Long insert(@BindBean Avaliacao avaliacao);

    @SqlUpdate("""
        UPDATE avaliacao SET
            nota = :nota,
            comentario = :comentario,
            id_atendimento_avaliacao = :idAtendimentoAvaliacao
        WHERE id_avaliacao = :idAvaliacao;
    """)
    int update(@BindBean Avaliacao avaliacao);

    @SqlUpdate("DELETE FROM avaliacao WHERE id_avaliacao = :id;")
    int delete(@Bind("id") Long id);
}