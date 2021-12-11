# Semantic Hostnames 0.1.0-alpha

## Summary

Given the hostname `acme-prd-web-01.gcp-yyz1`,

1. `acme` is the organization (e.g. project, client, company, etc.) the host belongs to,
2. `prd` is the [deployment environment](https://en.wikipedia.org/wiki/Deployment_environment),
3. `web` is what the host does,
4. `01` is the unique sequence number to differentiate from other Acme production web servers,
5. `gcp` means it is running on Google Cloud Platform, and
6. `yyz1` is the GPC region in Toronto (northamerica-northeast2).

Try creating your own with [semantic.host](https://semantic.host/)!

## Introduction

[Naming servers is hard](https://xkcd.com/910/), and it seems everyone has their preferred convention. You may already be familiar with some common examples,

- Gods (e.g. Apollo, Thor, etc.)
- Hammers (e.g. sledge, ballpeen, time, etc.)
- Meaningful but unintelligible (e.g. CAONADBP001)
- `openssl rand -hex 6` (e.g. 586ea38009a0)

Each of these conventions requires you already know what and where the server is, or how to parse a dense string of numbers and letters. The only person that inherently knows what `triceratops01` does is the person that set it up. Even with that knowledge interacting with these types of hostnames is challenging. How do you easily filter logs for only your production load balancers if all your systems are named after types of flowers?

**Semantic Hostnames** is [standard](https://xkcd.com/927/) for defining hostnames that are,

- human-readable without a Ph.D. in paleontology or floriculture,
- sortable such that hostnames are intuitively grouped by the organization, deployment environment, and role,

    ```bash
    sort < example_hosts.txt
    ```

- searchable with simple tools,

    ```bash
    # find all production load balancers running in Toronto, then sort
    grep -- '-prd-lb.*-yyz' example_hosts.txt | sort
    ```

- easily converted to FQDNs, and

    ```
    acme-stg-web-01.aws-sfo1 -> acme-stg-web-01.aws-sfo1.example.com
    ```

- usable in the terminal.

    ```bash
    nginx@acme-stg-web-01:~$ hostname -f # most terminals only show the first label
    acme-stg-web-01.aws-sfo1.example.com
    ```

## Semantic Hostname Specification

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED",  "MAY", and "OPTIONAL" in this document are to be interpreted as described in [RFC 2119](https://tools.ietf.org/html/rfc2119).

1. A hostname MUST take the form of `PURPOSE.LOCALE` where `PURPOSE` and `LOCALE` are labels, and MUST NOT exceed 253 characters.
2. A label MUST comprise only fields separated by hyphens, and MUST NOT exceed 63 characters.
3. A `PURPOSE` label MUST take the form of `ORGANIZATION-TIER-ROLE-SEQUENCE` where `ORGANIZATION`, `TIER`, `ROLE`, and `SEQUENCE` are fields.  
    a. An `ORGANIZATION` field MUST take the form of `[a-z0-9]+` and SHOULD describe the organization (e.g. project, client, company, etc.) the host belongs to.  
    b. A `TIER` field MUST take the form of `[a-z0-9]+` and SHOULD describe the deployment environment of the host.  
    c. A `ROLE` field MUST take the form of `[a-z0-9]+` and SHOULD describe the role the host serves in its deployment environment.  
    d. A `SEQUENCE` field MUST take the form of `[0-9]+` and uniquely identify a host from other hosts that share the same values in the preceding fields. A `SEQUENCE` field MUST be an integer greater than zero, and be left-padded with `n` zeros such that `10^n` is greater than the total number of hosts in the sequence.
4. A `LOCALE` label MUST take the form of `PROVIDER-REGION` where `PROVIDER` and `REGION` are fields.  
    a. A `PROVIDER` field MUST take the form of `[a-z0-9]{3}` and identify the infrastructure provider. If an infrastructure provider is not applicable, `onp` (on-premise) is RECOMMENDED.  
    b. A `REGION` field MUST take the form of `[a-z]{3}[1-9]`, and describe the geographic location and site identifier. The relevant IATA airport code followed by the availability zone is RECOMMENDED.

## FAQ

### Who is this for?

This is intended for those who treat their servers like pets, not cattle. If you are using software-defined infrastructure where hostnames aren't as relevant, or work in the datacenter of a tech giant where an internal naming scheme is already in place, this isn't for you.

### Why not include OS, CPU architecture, shape, or other information as part of the hostname?

For the most part, this is information that can change and the host can easily provide, so there is no need to include it as part of the hostname.

There are many ways to get this type of information, for example, this alias that will dump the architecture, number of processing units, and free memory for each host passed to it.

```bash
alias semantic_hostname_info='xargs -I{} \
    ssh {} '\''\
        echo $(hostname) \
        $(uname -m) \
        $(nproc) \
        $(free -h | grep Mem: | tr -s " " | cut -d " " -f 2) \
    '\'' | column -ts" "'
```

Here a list of SSH connection strings (`[user@]hostname`) is passed in, filtered for development hosts in Toronto, and then filtered for the ARM64 CPU architecture.

```bash
$ cat hosts.txt | grep 'dev.*\..*yyz' | semantic_hostname_info | grep 'aarch64'
olan-dev-dkr-02.onp-yyz1  aarch64  2  1.9Gi
```

## About

If you’d like to leave feedback, please [open an issue on GitHub](https://github.com/olanmatt/semantic.host/issues).
