package br.cefetmg.barbeariainclusao.repository;

import br.cefetmg.barbeariainclusao.model.Usuario;
import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.customizer.Bind;
import org.jdbi.v3.sqlobject.customizer.BindBean;
import org.jdbi.v3.sqlobject.statement.GetGeneratedKeys;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RegisterBeanMapper(Usuario.class)
public interface UsuarioRepository {

    @SqlQuery("SELECT * FROM usuario;")
    List<Usuario> findAll();

    @SqlQuery("SELECT * FROM usuario WHERE id_usuario = :id;")
    Usuario findById(@Bind("id") Long id);

    @SqlQuery("SELECT * FROM usuario WHERE email_usuario = :email AND senha_usuario = :senha;")
    Usuario findByEmailAndSenha(@Bind("email") String email, @Bind("senha") String senha);

    @SqlUpdate("""
        INSERT INTO usuario (
            nome_usuario,
            telefone_usuario,
            senha_usuario,
            email_usuario,
            foto_usuario
        )
        VALUES (
            :nomeUsuario,
            :telefoneUsuario,
            :senhaUsuario,
            :emailUsuario,
            :fotoUsuario
        );
    """)
    @GetGeneratedKeys
    Long insert(@BindBean Usuario usuario);

    @SqlUpdate("""
        UPDATE usuario SET
            nome_usuario = :nomeUsuario,
            telefone_usuario = :telefoneUsuario,
            senha_usuario = :senhaUsuario,
            email_usuario = :emailUsuario,
            foto_usuario = :fotoUsuario
        WHERE id_usuario = :idUsuario;
    """)
    int update(@BindBean Usuario usuario);

    @SqlUpdate("DELETE FROM usuario WHERE id_usuario = :id;")
    int delete(@Bind("id") Long id);
}
