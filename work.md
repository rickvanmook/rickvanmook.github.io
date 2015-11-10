---
layout: page
title: Work
permalink: /work/
---

<h1>Work</h1>

<ul>
{% for project in site.data.work %}
  <li>
    <h3>{{ project.title }}</h3>
    Year: {{ project.year }}<br>

    {% if project.sub-title %}
        {{ project.sub-title }}<br>
    {% endif %}

	{% if project.agency %}
        Agency: <a href="{{ project.agency.url }}" target="_blank">{{ project.agency.label }}</a><br>
    {% endif %}

	{% if project.role %}
        Role: {{ project.role }}<br>
    {% endif %}

    {% if project.recognitions %}
        Recognition:<br>

        {% for recognition in project.recognitions %}
	    <uL>
	        <li>{{ recognition }}</li>
	    </ul>
		{% endfor %}
    {% endif %}
  </li>
{% endfor %}
</ul>