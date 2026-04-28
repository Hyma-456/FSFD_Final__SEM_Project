package com.researchcollab.model;

import jakarta.persistence.*;

@Entity
@Table(name = "documents")
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String type;

    private String size;

    private String date;

    private String project;

    @Column(columnDefinition = "LONGTEXT")
    private String content;

    public Document() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getProject() { return project; }
    public void setProject(String project) { this.project = project; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
