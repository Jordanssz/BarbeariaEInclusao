package br.cefetmg.barbeariainclusao.repository;

import br.cefetmg.barbeariainclusao.model.Servico;
import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.customizer.Bind;
import org.jdbi.v3.sqlobject.customizer.BindBean;
import org.jdbi.v3.sqlobject.statement.GetGeneratedKeys;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RegisterBeanMapper(Servico.class)
public interface ServicoRepository {

    @SqlQuery("SELECT * FROM servico;")
    List<Servico> findAll();

    @SqlQuery("SELECT * FROM servico WHERE id_servico = :id;")
    Servico findById(@Bind("id") Long id);

    @SqlQuery("SELECT * FROM servico WHERE id_barbearia_servico = :idBarbearia") //anotacao: busca por barbearia
    List<Servico> findByBarbeariaId(@Bind("idBarbearia") Long idBarbearia);

    @SqlUpdate("""
    INSERT INTO servico (
        nome_servico,
        descricao_servico,
        preco_servico,
        id_barbearia_servico,
        id_barbeiro_servico
    )
    VALUES (
        :nomeServico,
        :descricaoServico,
        :precoServico,
        :idBarbeariaServico,
        :idBarbeiroServico
    );
""") //anotacao: inserção completa conforme modelo
    @GetGeneratedKeys
    Long insert(@BindBean Servico servico);

    @SqlUpdate("""
    UPDATE servico SET
        nome_servico = :nomeServico,
        descricao_servico = :descricaoServico,
        preco_servico = :precoServico,
        id_barbearia_servico = :idBarbeariaServico,
        id_barbeiro_servico = :idBarbeiroServico
    WHERE id_servico = :idServico;
""") //anotacao: atualização completa
    int update(@BindBean Servico servico);

    @SqlUpdate("DELETE FROM servico WHERE id_servico = :id;")
    int delete(@Bind("id") Long id);

    
}