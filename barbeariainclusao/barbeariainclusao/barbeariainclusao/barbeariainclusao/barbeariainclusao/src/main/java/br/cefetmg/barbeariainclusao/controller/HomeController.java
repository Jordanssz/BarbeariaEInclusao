package br.cefetmg.barbeariainclusao.controller;

import br.cefetmg.barbeariainclusao.model.Barbeiro;
import br.cefetmg.barbeariainclusao.model.Barbearia;
import br.cefetmg.barbeariainclusao.model.Servico;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/home") //http://localhost:8080/home
public class HomeController {

    // @GetMapping({"", "/"})
    // public ResponseEntity<Barbeiro> showBarbeiro(){
    //     Barbeiro barbeiro = new Barbeiro();
    //     barbeiro.setIdBarbeiro(1L);
    //     barbeiro.setNomeBarbeiro("Ronaldo");
    //     barbeiro.setDescricaoBarbeiro("Careca");
    //     barbeiro.setIdBarbeariaBarbeiro(1L);
    //     return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(barbeiro);
    // } 

    // @GetMapping("/barbearia")
    // public ResponseEntity<Barbearia> showBarbearia(){
    //     Barbearia barbearia = new Barbearia();
    //     barbearia.setIdBarbearia(1L);
    //     barbearia.setNomeBarbearia("Cortes");
    //     barbearia.setEnderecoBarbearia("Rua x, Bairro x, n xxx");
    //     barbearia.setDescricaoBarbearia("bacana");
    //     barbearia.setSenhaBarbearia("123456");
    //     barbearia.setEmailBarbearia("cortes@email.com");
    //     barbearia.setFotoBarbearia("foto.png");
    //     return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(barbearia);
    // }

    // @GetMapping("/servico")
    // public ResponseEntity<Servico> showServico() {
    //     Servico servico = new Servico();
    //     servico.setIdServico(1L);
    //     servico.setNomeServico("Corte Simples");
    //     servico.setDescricaoServico("Corte de cabelo tradicional");
    //     servico.setPrecoServico(25.0);
    //     servico.setIdBarbeariaServico(1L);
    //     servico.setIdBarbeiroServico(1L);
    //     return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(servico);
    // }
}
