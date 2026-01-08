package br.cefetmg.barbeariainclusao.controller;

import br.cefetmg.barbeariainclusao.model.Servico;
import br.cefetmg.barbeariainclusao.repository.ServicoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@CrossOrigin(origins = "http://localhost:8100")
@RestController
@RequestMapping("/api/v1/servico")
public class ServicoController {

    private final ServicoRepository servicoRepository;

    public ServicoController(ServicoRepository servicoRepository) {
        this.servicoRepository = servicoRepository;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Servico> getById(@PathVariable Long id) {
        Servico servico = servicoRepository.findById(id);
        if (servico != null) {
            return ResponseEntity.ok().body(servico);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    @GetMapping({"", "/"})
    public ResponseEntity<List<Servico>> getAll() {
        List<Servico> servicos = servicoRepository.findAll();
        return ResponseEntity.ok().body(servicos);
    }

    @GetMapping("/barbearia/{idBarbearia}") //anotacao: ajuste na rota para evitar conflito com /{id}
    public ResponseEntity<List<Servico>> listarPorBarbearia(@PathVariable Long idBarbearia) {
        List<Servico> servicos = servicoRepository.findByBarbeariaId(idBarbearia);
        return ResponseEntity.ok().body(servicos);
    }

    @PostMapping({"", "/"})
    public ResponseEntity<Servico> create(@RequestBody Servico servico) {
        //anotacao: validação de campos obrigatórios
        if (servico.getIdBarbeiroServico() == 0 || servico.getIdBarbeariaServico() == 0 ||
            servico.getNomeServico() == null || servico.getPrecoServico() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Campos obrigatórios inválidos");
        }

        Long id = servicoRepository.insert(servico);
        servico.setIdServico(id);
        return ResponseEntity.status(HttpStatus.CREATED).body(servico); //anotacao: retorno 201
    }

    @PutMapping("/{id}")
    public ResponseEntity<Servico> update(@PathVariable Long id, @RequestBody Servico servico) {
        if (servico.getIdServico() == null || !servico.getIdServico().equals(id)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ID do serviço inválido");
        }

        if (servico.getIdBarbeiroServico() == 0 || servico.getIdBarbeariaServico() == 0 ||
            servico.getNomeServico() == null || servico.getPrecoServico() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Campos obrigatórios inválidos");
        }

        int qtd = servicoRepository.update(servico);

        if (qtd == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nenhum serviço alterado");
        }
        if (qtd > 1) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Foi alterado mais de 1 serviço.");
        }

        return ResponseEntity.ok(servico);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Servico servico = servicoRepository.findById(id);
        if (servico == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Serviço não encontrado");
        }

        int qtd = servicoRepository.delete(id);

        if (qtd == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nenhum serviço excluído.");
        }
        if (qtd > 1) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Foi excluído mais de 1 serviço.");
        }

        return ResponseEntity.noContent().build(); //anotacao: retorno padrão para exclusão
    }
}