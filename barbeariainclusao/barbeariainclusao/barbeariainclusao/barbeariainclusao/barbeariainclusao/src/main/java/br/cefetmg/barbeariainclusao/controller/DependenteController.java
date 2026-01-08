package br.cefetmg.barbeariainclusao.controller;

import br.cefetmg.barbeariainclusao.model.Dependente;
import br.cefetmg.barbeariainclusao.repository.DependenteRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@CrossOrigin(origins = "http://localhost:8100")
@RestController
@RequestMapping("/api/v1/dependente")
public class DependenteController {

    private final DependenteRepository dependenteRepository;

    public DependenteController(DependenteRepository dependenteRepository) {
        this.dependenteRepository = dependenteRepository;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Dependente> getById(@PathVariable Long id) {
        Dependente dependente = dependenteRepository.findById(id);
        if (dependente != null) {
            return ResponseEntity.ok(dependente);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    @GetMapping({"", "/"})
    public ResponseEntity<List<Dependente>> getAll() {
        List<Dependente> dependentes = dependenteRepository.findAll();
        return ResponseEntity.ok(dependentes);
    }

    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<Dependente>> getByUsuario(@PathVariable Long idUsuario) {
        List<Dependente> dependentes = dependenteRepository.findByUsuario(idUsuario);
        return ResponseEntity.ok(dependentes);
    }

    @PostMapping({"", "/"})
    public ResponseEntity<Dependente> create(@RequestBody Dependente dependente) {
        if (dependente.getNomeDependente() == null || dependente.getIdUsuario() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nome e ID do usuário são obrigatórios");
        }

        Long id = dependenteRepository.insert(dependente);
        dependente.setIdDependente(id);
        return ResponseEntity.status(HttpStatus.CREATED).body(dependente);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Dependente> update(@PathVariable Long id, @RequestBody Dependente dependente) {
        if (dependente.getIdDependente() == null || !dependente.getIdDependente().equals(id)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ID do dependente inválido");
        }

        int qtd = dependenteRepository.update(dependente);
        if (qtd == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nenhum dependente alterado");
        }
        if (qtd > 1) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Mais de um dependente foi alterado");
        }

        return ResponseEntity.ok(dependente);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Dependente dependente = dependenteRepository.findById(id);
        if (dependente == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Dependente não encontrado");
        }

        int qtd = dependenteRepository.delete(id);
        if (qtd == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nenhum dependente excluído");
        }
        if (qtd > 1) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Mais de um dependente foi excluído");
        }

        return ResponseEntity.noContent().build();
    }
}