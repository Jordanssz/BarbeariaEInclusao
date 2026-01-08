package br.cefetmg.barbeariainclusao.controller;

import br.cefetmg.barbeariainclusao.model.Usuario;
import br.cefetmg.barbeariainclusao.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:8100")
@RestController
@RequestMapping("/api/v1/usuario")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;

    public UsuarioController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Usuario> getById(@PathVariable Long id) {
        Usuario usuario = usuarioRepository.findById(id);
        if (usuario != null) {
            return ResponseEntity.ok(usuario);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    @GetMapping({"", "/"})
    public ResponseEntity<List<Usuario>> getAll() {
        List<Usuario> usuarios = usuarioRepository.findAll();
        return ResponseEntity.ok(usuarios);
    }

    @PostMapping("/autenticar")
    public ResponseEntity<Usuario> autenticar(@RequestBody Map<String, String> login) {
        String email = login.get("emailUsuario");
        String senha = login.get("senhaUsuario");

        if (email == null || senha == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email e senha são obrigatórios");
        }

        Usuario usuario = usuarioRepository.findByEmailAndSenha(email, senha);
        if (usuario != null) {
            return ResponseEntity.ok(usuario);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @PostMapping("/cadastrar")
    public ResponseEntity<Usuario> cadastrar(@RequestBody Usuario usuario) {
        // Validação básica para campos obrigatórios (Nome, Email, Senha)
        if (usuario.getNomeUsuario() == null || usuario.getEmailUsuario() == null || usuario.getSenhaUsuario() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nome, email e senha são obrigatórios");
        }

        Long id = usuarioRepository.insert(usuario);
        usuario.setIdUsuario(id);
        return ResponseEntity.status(HttpStatus.CREATED).body(usuario);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Usuario> update(@PathVariable Long id, @RequestBody Usuario usuario) {
        if (usuario.getIdUsuario() == null || !usuario.getIdUsuario().equals(id)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ID do usuário inválido");
        }

        // Garante que o usuário existe antes de tentar atualizar
        if (usuarioRepository.findById(id) == null) {
             throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado para alteração");
        }

        int qtd = usuarioRepository.update(usuario);
        
        // As validações de qtd > 1 ou qtd == 0 após a atualização são boas práticas
        if (qtd == 0) {
            // Este caso é improvável se a checagem acima passar, mas é mantido como fallback
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nenhum usuário alterado"); 
        }
        
        return ResponseEntity.ok(usuario);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        // Checa a existência antes de deletar (prática recomendada)
        if (usuarioRepository.findById(id) == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado para exclusão");
        }

        int qtd = usuarioRepository.delete(id);
        
        // A checagem de qtd > 1 é mantida para garantir a integridade
        if (qtd > 1) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Mais de um usuário foi excluído");
        }

        return ResponseEntity.noContent().build();
    }
}
