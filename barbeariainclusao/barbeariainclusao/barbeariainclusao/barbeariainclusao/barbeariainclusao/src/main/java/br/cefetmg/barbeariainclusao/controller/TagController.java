package br.cefetmg.barbeariainclusao.controller;

import br.cefetmg.barbeariainclusao.model.Tag;
import br.cefetmg.barbeariainclusao.repository.TagRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@CrossOrigin(origins = "http://localhost:8100")
@RestController
@RequestMapping("/api/v1/tag")
public class TagController {

    private final TagRepository tagRepository;

    public TagController(TagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Tag> getById(@PathVariable Long id) {
        Tag tag = tagRepository.findById(id);
        if (tag != null) {
            return ResponseEntity.ok(tag);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    @GetMapping({"", "/"})
    public ResponseEntity<List<Tag>> getAll() {
        List<Tag> tags = tagRepository.findAll();
        return ResponseEntity.ok(tags);
    }

    @PostMapping({"", "/"})
    public ResponseEntity<Tag> create(@RequestBody Tag tag) {
        if (tag.getNomeTag() == null || tag.getDescricaoTag() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nome e descrição são obrigatórios");
        }

        Long id = tagRepository.insert(tag);
        tag.setIdTag(id);
        return ResponseEntity.status(HttpStatus.CREATED).body(tag);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Tag> update(@PathVariable Long id, @RequestBody Tag tag) {
        if (tag.getIdTag() == null || !tag.getIdTag().equals(id)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ID da tag inválido");
        }

        int qtd = tagRepository.update(tag);
        if (qtd == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nenhuma tag alterada");
        }
        if (qtd > 1) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Mais de uma tag foi alterada");
        }

        return ResponseEntity.ok(tag);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Tag tag = tagRepository.findById(id);
        if (tag == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tag não encontrada");
        }

        int qtd = tagRepository.delete(id);
        if (qtd == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nenhuma tag excluída");
        }
        if (qtd > 1) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Mais de uma tag foi excluída");
        }

        return ResponseEntity.noContent().build();
    }
}