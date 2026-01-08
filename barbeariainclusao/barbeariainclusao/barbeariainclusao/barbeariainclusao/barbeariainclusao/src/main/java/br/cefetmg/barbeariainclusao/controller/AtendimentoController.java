package br.cefetmg.barbeariainclusao.controller;

import br.cefetmg.barbeariainclusao.model.Atendimento;
import br.cefetmg.barbeariainclusao.repository.AtendimentoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@CrossOrigin(origins = "http://localhost:8100")
@RestController
@RequestMapping("/api/v1/atendimento")
public class AtendimentoController {

    private final AtendimentoRepository atendimentoRepository;

    public AtendimentoController(AtendimentoRepository atendimentoRepository) {
        this.atendimentoRepository = atendimentoRepository;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Atendimento> getById(@PathVariable Long id) {
        Atendimento atendimento = atendimentoRepository.findById(id);
        if (atendimento != null) {
            return ResponseEntity.ok(atendimento);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    // 💡 NOVO ENDPOINT: Implementação da busca por ID do usuário
    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<Atendimento>> getByUserId(@PathVariable Long idUsuario) {
        List<Atendimento> atendimentos = atendimentoRepository.findByUserId(idUsuario);
        return ResponseEntity.ok(atendimentos);
    }

    @GetMapping({"", "/"})
    public ResponseEntity<List<Atendimento>> getAll() {
        List<Atendimento> atendimentos = atendimentoRepository.findAll();
        return ResponseEntity.ok(atendimentos);
    }

    @PostMapping({"", "/"})
    public ResponseEntity<Atendimento> create(@RequestBody Atendimento atendimento) {
        if (atendimento.getIdUsuarioAtendimento() == 0 || atendimento.getIdBarbeiroAtendimento() == 0 ||
            atendimento.getIdServicoAtendimento() == 0 || atendimento.getDataAtendimento() == null ||
            atendimento.getHoraAtendimento() == null || atendimento.getStatusAtendimento() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Todos os campos obrigatórios devem ser preenchidos");
        }

        Long id = atendimentoRepository.insert(atendimento);
        atendimento.setIdAtendimento(id);
        return ResponseEntity.status(HttpStatus.CREATED).body(atendimento);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Atendimento> update(@PathVariable Long id, @RequestBody Atendimento atendimento) {
        if (atendimento.getIdAtendimento() == null || !atendimento.getIdAtendimento().equals(id)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ID do atendimento inválido");
        }

        int qtd = atendimentoRepository.update(atendimento);
        if (qtd == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nenhum atendimento alterado");
        }
        if (qtd > 1) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Mais de um atendimento foi alterado");
        }

        return ResponseEntity.ok(atendimento);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Atendimento atendimento = atendimentoRepository.findById(id);
        if (atendimento == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Atendimento não encontrado");
        }

        int qtd = atendimentoRepository.delete(id);
        if (qtd == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nenhum atendimento excluído");
        }
        if (qtd > 1) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Mais de um atendimento foi excluído");
        }

        return ResponseEntity.noContent().build();
    }
}
