package br.cefetmg.barbeariainclusao.repository;

import br.cefetmg.barbeariainclusao.model.Atendimento;
import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.customizer.Bind;
import org.jdbi.v3.sqlobject.customizer.BindBean;
import org.jdbi.v3.sqlobject.statement.GetGeneratedKeys;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RegisterBeanMapper(Atendimento.class)
public interface AtendimentoRepository {

    @SqlQuery("SELECT * FROM atendimento;")
    List<Atendimento> findAll();

    @SqlQuery("SELECT * FROM atendimento WHERE id_atendimento = :id;")
    Atendimento findById(@Bind("id") Long id);

    // 💡 Implementação da busca por ID do usuário
    @SqlQuery("SELECT * FROM atendimento WHERE id_usuario_atendimento = :idUsuario;")
    List<Atendimento> findByUserId(@Bind("idUsuario") Long idUsuario);

    @SqlUpdate("""
        INSERT INTO atendimento (
            id_usuario_atendimento,
            id_barbeiro_atendimento,
            id_servico_atendimento,
            data_atendimento,
            hora_atendimento,
            status_atendimento
        )
        VALUES (
            :idUsuarioAtendimento,
            :idBarbeiroAtendimento,
            :idServicoAtendimento,
            :dataAtendimento,
            :horaAtendimento,
            :statusAtendimento
        );
    """)
    @GetGeneratedKeys
    Long insert(@BindBean Atendimento atendimento);

    @SqlUpdate("""
        UPDATE atendimento SET
            id_usuario_atendimento = :idUsuarioAtendimento,
            id_barbeiro_atendimento = :idBarbeiroAtendimento,
            id_servico_atendimento = :idServicoAtendimento,
            data_atendimento = :dataAtendimento,
            hora_atendimento = :horaAtendimento,
            status_atendimento = :statusAtendimento
        WHERE id_atendimento = :idAtendimento;
    """)
    int update(@BindBean Atendimento atendimento);

    @SqlUpdate("DELETE FROM atendimento WHERE id_atendimento = :id;")
    int delete(@Bind("id") Long id);
}
