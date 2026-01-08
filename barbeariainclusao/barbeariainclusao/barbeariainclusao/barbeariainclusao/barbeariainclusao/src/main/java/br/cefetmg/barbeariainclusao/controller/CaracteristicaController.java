package br.cefetmg.barbeariainclusao.controller;

import br.cefetmg.barbeariainclusao.model.Caracteristica;
import br.cefetmg.barbeariainclusao.repository.CaracteristicaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@CrossOrigin(origins = "http://localhost:8100")
@RestController
@RequestMapping("/api/v1/caracteristica")
public class CaracteristicaController {

    private final CaracteristicaRepository caracteristicaRepository;

    public CaracteristicaController(CaracteristicaRepository caracteristicaRepository) {
        this.caracteristicaRepository = caracteristicaRepository;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Caracteristica> getById(@PathVariable Long id) {
        Caracteristica caracteristica = caracteristicaRepository.findById(id);
        if (caracteristica != null) {
            return ResponseEntity.ok(caracteristica);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    @GetMapping({"", "/"})
    public ResponseEntity<List<Caracteristica>> getAll() {
        List<Caracteristica> lista = caracteristicaRepository.findAll();
        return ResponseEntity.ok(lista);
    }

    @PostMapping({"", "/"})
    public ResponseEntity<Caracteristica> create(@RequestBody Caracteristica caracteristica) {
        if (caracteristica.getNomeCaracteristica() == null || caracteristica.getDescricaoCaracteristica() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nome e descrição são obrigatórios");
        }

        Long id = caracteristicaRepository.insert(caracteristica);
        caracteristica.setIdCaracteristica(id);
        return ResponseEntity.status(HttpStatus.CREATED).body(caracteristica);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Caracteristica> update(@PathVariable Long id, @RequestBody Caracteristica caracteristica) {
        if (caracteristica.getIdCaracteristica() == null || !caracteristica.getIdCaracteristica().equals(id)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ID inválido");
        }

        int qtd = caracteristicaRepository.update(caracteristica);
        if (qtd == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nenhuma característica alterada");
        }
        if (qtd > 1) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Mais de uma característica foi alterada");
        }

        return ResponseEntity.ok(caracteristica);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Caracteristica caracteristica = caracteristicaRepository.findById(id);
        if (caracteristica == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Característica não encontrada");
        }

        int qtd = caracteristicaRepository.delete(id);
        if (qtd == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nenhuma característica excluída");
        }
        if (qtd > 1) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Mais de uma característica foi excluída");
        }

        return ResponseEntity.noContent().build();
    }
}