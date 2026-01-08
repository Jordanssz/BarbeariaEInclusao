package br.cefetmg.barbeariainclusao.repository;

import br.cefetmg.barbeariainclusao.model.BarbeariaCaracteristica;
import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.customizer.Bind;
import org.jdbi.v3.sqlobject.customizer.BindBean;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RegisterBeanMapper(BarbeariaCaracteristica.class)
public interface BarbeariaCaracteristicaRepository {

    // 🔹 Buscar todas as características vinculadas a uma barbearia (com nome e descrição)
    @SqlQuery("""
        SELECT 
            bc.id_barbearia AS idBarbearia,
            bc.id_caracteristica AS idCaracteristica,
            bc.possui AS possui,
            c.nome_caracteristica AS nomeCaracteristica,
            c.descricao_caracteristica AS descricaoCaracteristica
        FROM barbearia_caracteristica bc
        JOIN caracteristica c ON c.id_caracteristica = bc.id_caracteristica
        WHERE bc.id_barbearia = :idBarbearia;
    """)
    List<BarbeariaCaracteristica> findByBarbearia(@Bind("idBarbearia") Long idBarbearia);

    // (resto do código igual)
    @SqlQuery("""
        SELECT * FROM barbearia_caracteristica
        WHERE id_caracteristica = :idCaracteristica;
    """)
    List<BarbeariaCaracteristica> findByCaracteristica(@Bind("idCaracteristica") Long idCaracteristica);

    @SqlUpdate("""
        INSERT INTO barbearia_caracteristica (id_barbearia, id_caracteristica, possui)
        VALUES (:idBarbearia, :idCaracteristica, :possui)
        ON DUPLICATE KEY UPDATE possui = :possui;
    """)
    void upsert(@BindBean BarbeariaCaracteristica vinculo);

    @SqlUpdate("""
        DELETE FROM barbearia_caracteristica
        WHERE id_barbearia = :idBarbearia AND id_caracteristica = :idCaracteristica;
    """)
    int delete(@Bind("idBarbearia") Long idBarbearia, @Bind("idCaracteristica") Long idCaracteristica);

    @SqlUpdate("""
        DELETE FROM barbearia_caracteristica
        WHERE id_barbearia = :idBarbearia;
    """)
    void deleteByBarbearia(@Bind("idBarbearia") Long idBarbearia);
}

