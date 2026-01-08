package br.cefetmg.barbeariainclusao.controller;

import br.cefetmg.barbeariainclusao.model.Avaliacao;
import br.cefetmg.barbeariainclusao.repository.AvaliacaoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@CrossOrigin(origins = "http://localhost:8100")
@RestController
@RequestMapping("/api/v1/avaliacao")
public class AvaliacaoController {

    private final AvaliacaoRepository avaliacaoRepository;

    public AvaliacaoController(AvaliacaoRepository avaliacaoRepository) {
        this.avaliacaoRepository = avaliacaoRepository;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Avaliacao> getById(@PathVariable Long id) {
        Avaliacao avaliacao = avaliacaoRepository.findById(id);
        if (avaliacao != null) {
            return ResponseEntity.ok(avaliacao);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    @GetMapping({"", "/"})
    public ResponseEntity<List<Avaliacao>> getAll() {
        List<Avaliacao> avaliacoes = avaliacaoRepository.findAll();
        return ResponseEntity.ok(avaliacoes);
    }

    @GetMapping("/atendimento/{idAtendimento}")
    public ResponseEntity<List<Avaliacao>> getByAtendimento(@PathVariable Long idAtendimento) {
        List<Avaliacao> avaliacoes = avaliacaoRepository.findByAtendimento(idAtendimento);
        return ResponseEntity.ok(avaliacoes);
    }

    @PostMapping({"", "/"})
    public ResponseEntity<Avaliacao> create(@RequestBody Avaliacao avaliacao) {
        if (avaliacao.getNota() < 0 || avaliacao.getNota() > 5 || avaliacao.getIdAtendimentoAvaliacao() == 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nota inválida ou atendimento não informado");
        }

        Long id = avaliacaoRepository.insert(avaliacao);
        avaliacao.setIdAvaliacao(id);
        return ResponseEntity.status(HttpStatus.CREATED).body(avaliacao);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Avaliacao> update(@PathVariable Long id, @RequestBody Avaliacao avaliacao) {
        if (avaliacao.getIdAvaliacao() == null || !avaliacao.getIdAvaliacao().equals(id)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ID da avaliação inválido");
        }

        int qtd = avaliacaoRepository.update(avaliacao);
        if (qtd == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nenhuma avaliação alterada");
        }
        if (qtd > 1) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Mais de uma avaliação foi alterada");
        }

        return ResponseEntity.ok(avaliacao);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Avaliacao avaliacao = avaliacaoRepository.findById(id);
        if (avaliacao == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Avaliação não encontrada");
        }

        int qtd = avaliacaoRepository.delete(id);
        if (qtd == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nenhuma avaliação excluída");
        }
        if (qtd > 1) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Mais de uma avaliação foi excluída");
        }

        return ResponseEntity.noContent().build();
    }
}