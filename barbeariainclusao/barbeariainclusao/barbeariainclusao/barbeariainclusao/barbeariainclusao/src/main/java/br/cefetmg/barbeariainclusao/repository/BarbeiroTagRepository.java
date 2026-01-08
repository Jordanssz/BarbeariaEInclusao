package br.cefetmg.barbeariainclusao.repository;

import br.cefetmg.barbeariainclusao.model.BarbeiroTag;
import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.customizer.Bind;
import org.jdbi.v3.sqlobject.customizer.BindBean;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RegisterBeanMapper(BarbeiroTag.class)
public interface BarbeiroTagRepository {

    // 🔍 Buscar todas as tags vinculadas a um barbeiro
    @SqlQuery("""
        SELECT bt.*, t.nome_tag AS nomeTag
        FROM barbeiro_tag bt
        JOIN tag t ON t.id_tag = bt.id_tag
        WHERE bt.id_barbeiro = :idBarbeiro;
    """)
    List<BarbeiroTag> findByBarbeiro(@Bind("idBarbeiro") Long idBarbeiro);

    // 🔍 Buscar todos os barbeiros com uma tag específica
    @SqlQuery("""
        SELECT * FROM barbeiro_tag
        WHERE id_tag = :idTag;
    """)
    List<BarbeiroTag> findByTag(@Bind("idTag") Long idTag);

    // 💾 Inserir ou atualizar vínculo (upsert)
    @SqlUpdate("""
        INSERT INTO barbeiro_tag (id_barbeiro, id_tag, possui)
        VALUES (:idBarbeiro, :idTag, :possui)
        ON DUPLICATE KEY UPDATE possui = :possui;
    """)
    void upsert(@BindBean BarbeiroTag vinculo);

    // ❌ Excluir vínculo específico
    @SqlUpdate("""
        DELETE FROM barbeiro_tag
        WHERE id_barbeiro = :idBarbeiro AND id_tag = :idTag;
    """)
    int delete(@Bind("idBarbeiro") Long idBarbeiro, @Bind("idTag") Long idTag);

    // ❌ Excluir todos os vínculos de um barbeiro
    @SqlUpdate("""
        DELETE FROM barbeiro_tag
        WHERE id_barbeiro = :idBarbeiro;
    """)
    void deleteByBarbeiro(@Bind("idBarbeiro") Long idBarbeiro);
}
