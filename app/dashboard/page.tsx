"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import * as d3 from "d3";

interface PokemonTypeStats {
  name: string;
  averageBaseExperience: number;
  uniqueAbilities: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<PokemonTypeStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("https://pokeapi.co/api/v2/type");
        if (!response.ok) {
          throw new Error("Failed to fetch Pokémon types");
        }
        const data = await response.json();

        const typeStats = await Promise.all(
          data.results.map(async (type: { name: string; url: string }) => {
            const typeResponse = await fetch(type.url);
            if (!typeResponse.ok) {
              throw new Error(`Failed to fetch data for ${type.name}`);
            }
            const typeData = await typeResponse.json();

            const pokemonDetails = await Promise.all(
              typeData.pokemon.slice(0, 10).map(async (p: { pokemon: { url: string } }) => {
                const pokemonResponse = await fetch(p.pokemon.url);
                if (!pokemonResponse.ok) {
                  throw new Error(`Failed to fetch Pokémon data for ${type.name}`);
                }
                return pokemonResponse.json();
              })
            );

            const totalBaseExperience = pokemonDetails.reduce(
              (sum, p) => sum + (p.base_experience || 0),
              0
            );
            const averageBaseExperience =
              pokemonDetails.length > 0 ? totalBaseExperience / pokemonDetails.length : 0;
            const uniqueAbilities = new Set(
              pokemonDetails.flatMap((p) => p.abilities.map((a: any) => a.ability.name))
            ).size;

            return {
              name: type.name,
              averageBaseExperience,
              uniqueAbilities,
            };
          })
        );

        setStats(typeStats);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (stats.length > 0 && chartRef.current) {
      createChart();
    }
  }, [stats]);

  const createChart = () => {
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    d3.select(chartRef.current).selectAll("*").remove();

    const svg = d3
      .select(chartRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleBand()
      .range([0, width])
      .domain(stats.map((d) => d.name))
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(stats, (d) => Math.max(d.averageBaseExperience, d.uniqueAbilities)) || 0]);

    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    svg.append("g").call(d3.axisLeft(y));

    svg
      .selectAll(".bar-experience")
      .data(stats)
      .enter()
      .append("rect")
      .attr("class", "bar-experience")
      .attr("x", (d) => x(d.name) || 0)
      .attr("width", x.bandwidth() / 2)
      .attr("y", (d) => y(d.averageBaseExperience))
      .attr("height", (d) => height - y(d.averageBaseExperience))
      .attr("fill", "rgba(255, 99, 132, 0.5)");

    svg
      .selectAll(".bar-abilities")
      .data(stats)
      .enter()
      .append("rect")
      .attr("class", "bar-abilities")
      .attr("x", (d) => (x(d.name) || 0) + x.bandwidth() / 2)
      .attr("width", x.bandwidth() / 2)
      .attr("y", (d) => y(d.uniqueAbilities))
      .attr("height", (d) => height - y(d.uniqueAbilities))
      .attr("fill", "rgba(53, 162, 235, 0.5)");

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Value");

    const legend = svg
      .append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
      .selectAll("g")
      .data(["Average Base Experience", "Unique Abilities"])
      .enter()
      .append("g")
      .attr("transform", (d, i) => `translate(0,${i * 20})`);

    legend
      .append("rect")
      .attr("x", width - 19)
      .attr("width", 19)
      .attr("height", 19)
      .attr("fill", (d, i) => (i === 0 ? "rgba(255, 99, 132, 0.5)" : "rgba(53, 162, 235, 0.5)"));

    legend
      .append("text")
      .attr("x", width - 24)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text((d) => d);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Pokémon Type Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <svg ref={chartRef}></svg>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Statistics Table</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Average Base Experience</TableHead>
                <TableHead>Unique Abilities</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.map((stat) => (
                <TableRow key={stat.name}>
                  <TableCell className="font-medium">{stat.name}</TableCell>
                  <TableCell>{stat.averageBaseExperience.toFixed(2)}</TableCell>
                  <TableCell>{stat.uniqueAbilities}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

