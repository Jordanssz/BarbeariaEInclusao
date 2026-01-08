package br.cefetmg.barbeariainclusao.repository;

import br.cefetmg.barbeariainclusao.model.Dependente;
import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.customizer.Bind;
import org.jdbi.v3.sqlobject.customizer.BindBean;
import org.jdbi.v3.sqlobject.statement.GetGeneratedKeys;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RegisterBeanMapper(Dependente.class)
public interface DependenteRepository {

    @SqlQuery("SELECT * FROM dependente;")
    List<Dependente> findAll();

    @SqlQuery("SELECT * FROM dependente WHERE id_dependente = :id;")
    Dependente findById(@Bind("id") Long id);

    @SqlQuery("SELECT * FROM dependente WHERE id_usuario = :idUsuario;")
    List<Dependente> findByUsuario(@Bind("idUsuario") Long idUsuario);

    @SqlUpdate("""
        INSERT INTO dependente (
            nome_dependente,
            descricao_dependente,
            id_usuario
        )
        VALUES (
            :nomeDependente,
            :descricaoDependente,
            :idUsuario
        );
    """)
    @GetGeneratedKeys
    Long insert(@BindBean Dependente dependente);

    @SqlUpdate("""
        UPDATE dependente SET
            nome_dependente = :nomeDependente,
            descricao_dependente = :descricaoDependente,
            id_usuario = :idUsuario
        WHERE id_dependente = :idDependente;
    """)
    int update(@BindBean Dependente dependente);

    @SqlUpdate("DELETE FROM dependente WHERE id_dependente = :id;")
    int delete(@Bind("id") Long id);
}