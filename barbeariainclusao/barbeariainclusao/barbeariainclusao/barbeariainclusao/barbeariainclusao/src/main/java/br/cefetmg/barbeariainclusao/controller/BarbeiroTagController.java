package br.cefetmg.barbeariainclusao.controller;

import br.cefetmg.barbeariainclusao.model.BarbeiroTag;
import br.cefetmg.barbeariainclusao.repository.BarbeiroTagRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@CrossOrigin(origins = "http://localhost:8100")
@RestController
@RequestMapping("/api/v1/barbeiro-tag")
public class BarbeiroTagController {

    private final BarbeiroTagRepository repository;

    public BarbeiroTagController(BarbeiroTagRepository repository) {
        this.repository = repository;
    }

    // ✅ Buscar todas as tags de um barbeiro
    @GetMapping("/barbeiro/{idBarbeiro}")
    public ResponseEntity<List<BarbeiroTag>> getByBarbeiro(@PathVariable Long idBarbeiro) {
        List<BarbeiroTag> lista = repository.findByBarbeiro(idBarbeiro);
        return ResponseEntity.ok(lista);
    }

    // ✅ Buscar todos os barbeiros que possuem uma tag específica
    @GetMapping("/tag/{idTag}")
    public ResponseEntity<List<BarbeiroTag>> getByTag(@PathVariable Long idTag) {
        List<BarbeiroTag> lista = repository.findByTag(idTag);
        return ResponseEntity.ok(lista);
    }

    // ✅ Inserir ou atualizar (upsert) o vínculo entre barbeiro e tag
    @PostMapping
    public ResponseEntity<BarbeiroTag> vincularOuAtualizar(@RequestBody BarbeiroTag vinculo) {
        if (vinculo.getIdBarbeiro() == null || vinculo.getIdTag() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "IDs obrigatórios");
        }

        if (vinculo.getPossui() == null) {
            vinculo.setPossui(true); // por padrão, assume que está vinculando
        }

        repository.upsert(vinculo);
        return ResponseEntity.status(HttpStatus.CREATED).body(vinculo);
    }

    // ✅ Excluir um vínculo específico
    @DeleteMapping
    public ResponseEntity<Void> desvincular(@RequestBody BarbeiroTag vinculo) {
        int qtd = repository.delete(vinculo.getIdBarbeiro(), vinculo.getIdTag());
        if (qtd == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Vínculo não encontrado");
        }
        return ResponseEntity.noContent().build();
    }

    // ✅ Excluir todos os vínculos de um barbeiro
    @DeleteMapping("/barbeiro/{idBarbeiro}")
    public ResponseEntity<Void> deleteByBarbeiro(@PathVariable Long idBarbeiro) {
        repository.deleteByBarbeiro(idBarbeiro);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/lote") 
    public ResponseEntity<List<BarbeiroTag>> vincularEmLote(@RequestBody List<BarbeiroTag> vinculos) {
        if (vinculos == null || vinculos.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Lista de vínculos vazia ou nula");
        }

        // Você precisará implementar um método para processar esta lista no seu repository.
        // Por exemplo: repository.upsertList(vinculos);
        
        // Simulação do processamento (substitua pela sua lógica real de upsert em lote)
        for (BarbeiroTag vinculo : vinculos) {
             if (vinculo.getIdBarbeiro() == null || vinculo.getIdTag() == null) {
                 throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "IDs obrigatórios em algum vínculo");
             }
             if (vinculo.getPossui() == null) {
                 vinculo.setPossui(true);
             }
             repository.upsert(vinculo); // Usando a função single para simular o salvamento de cada item
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(vinculos);
    }
    // ----------------------------------------
}
