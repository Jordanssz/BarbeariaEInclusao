package br.cefetmg.barbeariainclusao.repository;

import br.cefetmg.barbeariainclusao.model.Barbeiro;
import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.customizer.Bind;
import org.jdbi.v3.sqlobject.customizer.BindBean;
import org.jdbi.v3.sqlobject.statement.GetGeneratedKeys;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RegisterBeanMapper(Barbeiro.class)
public interface BarbeiroRepository {

    @SqlQuery("SELECT * FROM barbeiro;")
    List<Barbeiro> findAll();

    @SqlQuery("SELECT * FROM barbeiro WHERE id_barbeiro = :id;")
    Barbeiro findById(@Bind("id") Long id);

    @SqlQuery("SELECT EXISTS(SELECT 1 FROM barbeiro WHERE id_barbeiro = :id)") //anotacao: verificação de existência (RN05)
    boolean existsById(@Bind("id") Long id);

    @SqlQuery("SELECT COUNT(*) FROM barbeiro WHERE id_barbearia_barbeiro = :idBarbearia") //anotacao: verificação de limite (RN04)
    int countByBarbearia(@Bind("idBarbearia") Long idBarbearia);

    @SqlQuery("SELECT * FROM barbeiro WHERE id_barbearia_barbeiro = :idBarbearia") //anotacao: listar barbeiros por barbearia (RN06)
    List<Barbeiro> findByBarbearia(@Bind("idBarbearia") Long idBarbearia);

    @SqlQuery("""
        SELECT b.* FROM barbeiro b
        JOIN barbeiro_barbearia bb ON b.id_barbeiro = bb.id_barbeiro
        WHERE bb.id_barbearia = :idBarbearia
    """)
    List<Barbeiro> findAssociatedByBarbearia(@Bind("idBarbearia") Long idBarbearia);
    @SqlUpdate("""
        INSERT INTO barbeiro (
            nome_barbeiro,
            descricao_barbeiro,
            email_barbeiro,
            telefone_barbeiro,
            foto_barbeiro,
            senha_barbeiro,
            id_barbearia_barbeiro
        )
        VALUES (
            :nomeBarbeiro,
            :descricaoBarbeiro,
            :emailBarbeiro,
            :telefoneBarbeiro,
            :fotoBarbeiro,
            :senhaBarbeiro,
            :idBarbeariaBarbeiro
        );
    """) //anotacao: campos completos conforme modelo atualizado
    @GetGeneratedKeys
    Long insert(@BindBean Barbeiro barbeiro);

    @SqlUpdate("""
        UPDATE barbeiro SET
            nome_barbeiro = :nomeBarbeiro,
            descricao_barbeiro = :descricaoBarbeiro,
            email_barbeiro = :emailBarbeiro,
            telefone_barbeiro = :telefoneBarbeiro,
            foto_barbeiro = :fotoBarbeiro,
            senha_barbeiro = :senhaBarbeiro,
            id_barbearia_barbeiro = :idBarbeariaBarbeiro
        WHERE id_barbeiro = :idBarbeiro;
    """) //anotacao: atualização completa com todos os campos
    int update(@BindBean Barbeiro barbeiro);

    @SqlUpdate("DELETE FROM barbeiro WHERE id_barbeiro = :id;")
    int delete(@Bind("id") Long id);

    @SqlQuery("""
        SELECT * FROM barbeiro 
        WHERE email_barbeiro = :email 
        AND senha_barbeiro = :senha;
    """)
    Barbeiro findByEmailAndSenha(
        @Bind("email") String email, 
        @Bind("senha") String senha
    );

    @SqlQuery("SELECT EXISTS(SELECT 1 FROM barbeiro WHERE id_barbeiro = :id AND id_barbearia_barbeiro IS NULL)")
    boolean isNotAssociated(@Bind("id") Long id);

    @SqlUpdate("DELETE FROM barbeiro_barbearia WHERE id_barbeiro = :idBarbeiro AND id_barbearia = :idBarbearia")
    int desvincularRelacao(@Bind("idBarbeiro") Long idBarbeiro, @Bind("idBarbearia") Long idBarbearia);
}