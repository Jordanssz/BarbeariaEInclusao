package br.cefetmg.barbeariainclusao.repository;

import br.cefetmg.barbeariainclusao.model.Caracteristica;
import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.customizer.Bind;
import org.jdbi.v3.sqlobject.customizer.BindBean;
import org.jdbi.v3.sqlobject.statement.GetGeneratedKeys;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RegisterBeanMapper(Caracteristica.class)
public interface CaracteristicaRepository {

    @SqlQuery("SELECT * FROM caracteristica;")
    List<Caracteristica> findAll();

    @SqlQuery("SELECT * FROM caracteristica WHERE id_caracteristica = :id;")
    Caracteristica findById(@Bind("id") Long id);

    @SqlUpdate("""
        INSERT INTO caracteristica (
            nome_caracteristica,
            descricao_caracteristica
        )
        VALUES (
            :nomeCaracteristica,
            :descricaoCaracteristica
        );
    """)
    @GetGeneratedKeys
    Long insert(@BindBean Caracteristica caracteristica);

    @SqlUpdate("""
        UPDATE caracteristica SET
            nome_caracteristica = :nomeCaracteristica,
            descricao_caracteristica = :descricaoCaracteristica
        WHERE id_caracteristica = :idCaracteristica;
    """)
    int update(@BindBean Caracteristica caracteristica);

    @SqlUpdate("DELETE FROM caracteristica WHERE id_caracteristica = :id;")
    int delete(@Bind("id") Long id);
}