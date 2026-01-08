package br.cefetmg.barbeariainclusao.repository;

import br.cefetmg.barbeariainclusao.model.Barbearia;
import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.customizer.Bind;
import org.jdbi.v3.sqlobject.customizer.BindBean;
import org.jdbi.v3.sqlobject.statement.GetGeneratedKeys;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RegisterBeanMapper(Barbearia.class)
public interface BarbeariaRepository {

    // 💡 MÉTODO MODIFICADO: Retorna à versão simples. A ordenação por proximidade
    // será feita na camada Service/Controller usando a lógica Java/Haversine.
    @SqlQuery("SELECT * FROM barbearia;")
    List<Barbearia> findAll();

    @SqlQuery("SELECT * FROM barbearia WHERE id_barbearia = :id;")
    Barbearia findById(@Bind("id") Long id);

    @SqlQuery("SELECT * FROM barbearia WHERE email_barbearia = :email AND senha_barbearia = :senha;")
    Barbearia findByEmailAndSenha(@Bind("email") String email, @Bind("senha") String senha);

    // Nota: O ILIKE é específico para PostgreSQL. Se estiver usando MySQL, use LIKE.
    @SqlQuery("SELECT * FROM barbearia WHERE nome_barbearia ILIKE '%' || :nome || '%'") 
    List<Barbearia> findByNome(@Bind("nome") String nome);

    // ✅ NOVA QUERY: Busca uma barbearia pelo ID
    @SqlQuery("SELECT * FROM barbearia WHERE id_barbearia = :idBarbearia")
    Barbearia findDtoById(@Bind("idBarbearia") Long idBarbearia);


    @SqlUpdate("""
        INSERT INTO barbearia (
            nome_barbearia,
            endereco_barbearia,
            descricao_barbearia,
            senha_barbearia,
            email_barbearia,
            foto_barbearia,
            latitude,
            longitude
        )
        VALUES (
            :nomeBarbearia,
            :enderecoBarbearia,
            :descricaoBarbearia,
            :senhaBarbearia,
            :emailBarbearia,
            :fotoBarbearia,
            :latitude,
            :longitude
        );
    """)
    @GetGeneratedKeys
    Long insert(@BindBean Barbearia barbearia);

    @SqlUpdate("""
    UPDATE barbearia SET
        nome_barbearia = :nomeBarbearia,
        endereco_barbearia = :enderecoBarbearia,
        descricao_barbearia = :descricaoBarbearia,
        senha_barbearia = :senhaBarbearia,
        email_barbearia = :emailBarbearia,
        foto_barbearia = :fotoBarbearia,
        latitude = :latitude,
        longitude = :longitude
    WHERE id_barbearia = :idBarbearia;
    """)
    int update(@BindBean Barbearia barbearia);

    @SqlUpdate("DELETE FROM barbearia WHERE id_barbearia = :id;")
    int delete(@Bind("id") Long id);
}
