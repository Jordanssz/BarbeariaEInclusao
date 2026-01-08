package br.cefetmg.barbeariainclusao.controller;

import br.cefetmg.barbeariainclusao.controller.CriarSolicitacaoDTO;
import br.cefetmg.barbeariainclusao.model.Solicitacao;
import br.cefetmg.barbeariainclusao.repository.SolicitacaoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@CrossOrigin(origins = "http://localhost:8100")
@RestController
@RequestMapping("/api/v1/solicitacao")
public class SolicitacaoController {

    private final SolicitacaoRepository solicitacaoRepository;

    public SolicitacaoController(SolicitacaoRepository solicitacaoRepository) {
        this.solicitacaoRepository = solicitacaoRepository;
    }

    // =========================
    // CREATE (BARBEARIA → BARBEIRO)
    // =========================
    @PostMapping
    public ResponseEntity<Solicitacao> create(@RequestBody CriarSolicitacaoDTO dto) {

        if (dto.getCodigoProfissional() == null || dto.getIdBarbeariaRemetente() == null) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Código do profissional e barbearia são obrigatórios"
            );
        }

        Long idBarbeiro = solicitacaoRepository.buscarIdBarbeiroPorCodigo(dto.getCodigoProfissional());

        if (idBarbeiro == null) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Profissional não encontrado"
            );
        }

        Solicitacao solicitacao = new Solicitacao();
        solicitacao.setIdBarbeiroDestinatario(idBarbeiro);
        solicitacao.setIdBarbeariaRemetente(dto.getIdBarbeariaRemetente());
        solicitacao.setEstadoSolicitacao("PENDENTE");

        Long id = solicitacaoRepository.insert(solicitacao);
        solicitacao.setIdSolicitacao(id);

        return ResponseEntity.status(HttpStatus.CREATED).body(solicitacao);
    }

    // =========================
    // ACEITAR SOLICITAÇÃO
    // =========================
    @PutMapping("/{id}/aceitar")
    public ResponseEntity<Void> aceitar(@PathVariable Long id) {

        Solicitacao s = solicitacaoRepository.findById(id);
        if (s == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Solicitação não encontrada");
        }

        solicitacaoRepository.criarVinculo(
            s.getIdBarbeiroDestinatario(),
            s.getIdBarbeariaRemetente()
        );

        s.setEstadoSolicitacao("ACEITO");
        solicitacaoRepository.update(s);

        return ResponseEntity.ok().build();
    }

    // =========================
    // RECUSAR SOLICITAÇÃO
    // =========================
    @PutMapping("/{id}/recusar")
    public ResponseEntity<Void> recusar(@PathVariable Long id) {

        Solicitacao s = solicitacaoRepository.findById(id);
        if (s == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Solicitação não encontrada");
        }

        s.setEstadoSolicitacao("RECUSADO");
        solicitacaoRepository.update(s);

        return ResponseEntity.ok().build();
    }

    // =========================
    // CONSULTAS
    // =========================
    @GetMapping("/barbeiro/{idBarbeiro}")
    public ResponseEntity<List<Solicitacao>> getByBarbeiro(@PathVariable Long idBarbeiro) {
        return ResponseEntity.ok(
            solicitacaoRepository.findByBarbeiroDestinatario(idBarbeiro)
        );
    }

    @GetMapping("/barbearia/{idBarbearia}")
    public ResponseEntity<List<Solicitacao>> getByBarbearia(@PathVariable Long idBarbearia) {
        return ResponseEntity.ok(
            solicitacaoRepository.findByBarbeariaRemetente(idBarbearia)
        );
    }
}
