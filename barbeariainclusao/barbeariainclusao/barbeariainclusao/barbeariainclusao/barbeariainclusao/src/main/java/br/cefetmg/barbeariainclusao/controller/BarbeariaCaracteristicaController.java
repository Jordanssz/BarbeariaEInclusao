package br.cefetmg.barbeariainclusao.controller;

import br.cefetmg.barbeariainclusao.model.BarbeariaCaracteristica;
import br.cefetmg.barbeariainclusao.repository.BarbeariaCaracteristicaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@CrossOrigin(origins = "http://localhost:8100")
@RestController
@RequestMapping("/api/v1/barbearia-caracteristica")
public class BarbeariaCaracteristicaController {

    private final BarbeariaCaracteristicaRepository repository;

    public BarbeariaCaracteristicaController(BarbeariaCaracteristicaRepository repository) {
        this.repository = repository;
    }

    // Buscar todas as características de uma barbearia
    @GetMapping("/barbearia/{idBarbearia}")
    public ResponseEntity<List<BarbeariaCaracteristica>> getByBarbearia(@PathVariable Long idBarbearia) {
        List<BarbeariaCaracteristica> lista = repository.findByBarbearia(idBarbearia);
        return ResponseEntity.ok(lista);
    }

    // Buscar todas as barbearias que possuem uma característica específica
    @GetMapping("/caracteristica/{idCaracteristica}")
    public ResponseEntity<List<BarbeariaCaracteristica>> getByCaracteristica(@PathVariable Long idCaracteristica) {
        List<BarbeariaCaracteristica> lista = repository.findByCaracteristica(idCaracteristica);
        return ResponseEntity.ok(lista);
    }

    // Vincular ou atualizar uma característica (Sim/Não)
    @PostMapping
    public ResponseEntity<Void> vincularOuAtualizar(@RequestBody BarbeariaCaracteristica vinculo) {
        if (vinculo.getIdBarbearia() == null || vinculo.getIdCaracteristica() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "IDs obrigatórios");
        }
        if (vinculo.getPossui() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Campo 'possui' é obrigatório (true/false)");
        }

        repository.upsert(vinculo);
        return ResponseEntity.ok().build();
    }

    // Vincular/atualizar várias características de uma só vez
    @PostMapping("/lote")
    public ResponseEntity<Void> vincularOuAtualizarEmLote(@RequestBody List<BarbeariaCaracteristica> lista) {
        if (lista == null || lista.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Lista vazia");
        }
        for (BarbeariaCaracteristica vinculo : lista) {
            if (vinculo.getIdBarbearia() == null || vinculo.getIdCaracteristica() == null || vinculo.getPossui() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Todos os campos são obrigatórios em cada item");
            }
            repository.upsert(vinculo);
        }
        return ResponseEntity.ok().build();
    }

    // Excluir vínculo específico
    @DeleteMapping
    public ResponseEntity<Void> desvincular(@RequestBody BarbeariaCaracteristica vinculo) {
        int qtd = repository.delete(vinculo.getIdBarbearia(), vinculo.getIdCaracteristica());
        if (qtd == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Vínculo não encontrado");
        }
        return ResponseEntity.noContent().build();
    }

    // Excluir todos os vínculos de uma barbearia
    @DeleteMapping("/barbearia/{idBarbearia}")
    public ResponseEntity<Void> excluirTodos(@PathVariable Long idBarbearia) {
        repository.deleteByBarbearia(idBarbearia);
        return ResponseEntity.noContent().build();
    }
}
