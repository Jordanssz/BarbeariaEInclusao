package br.cefetmg.barbeariainclusao.repository;

import br.cefetmg.barbeariainclusao.model.Tag;
import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.customizer.Bind;
import org.jdbi.v3.sqlobject.customizer.BindBean;
import org.jdbi.v3.sqlobject.statement.GetGeneratedKeys;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RegisterBeanMapper(Tag.class)
public interface TagRepository {

    @SqlQuery("SELECT * FROM tag;")
    List<Tag> findAll();

    @SqlQuery("SELECT * FROM tag WHERE id_tag = :id;")
    Tag findById(@Bind("id") Long id);

    @SqlUpdate("""
        INSERT INTO tag (
            nome_tag,
            descricao_tag
        )
        VALUES (
            :nomeTag,
            :descricaoTag
        );
    """)
    @GetGeneratedKeys
    Long insert(@BindBean Tag tag);

    @SqlUpdate("""
        UPDATE tag SET
            nome_tag = :nomeTag,
            descricao_tag = :descricaoTag
        WHERE id_tag = :idTag;
    """)
    int update(@BindBean Tag tag);

    @SqlUpdate("DELETE FROM tag WHERE id_tag = :id;")
    int delete(@Bind("id") Long id);
}